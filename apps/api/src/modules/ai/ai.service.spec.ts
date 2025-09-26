import { Test, TestingModule } from '@nestjs/testing';
import { AiService, PropertyScoreResult } from './ai.service';

// Mock OpenAI
const mockOpenAIResponses = {
  create: jest.fn(),
};

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    responses: mockOpenAIResponses,
  })),
}));

describe('AiService', () => {
  let service: AiService;

  const mockProperty = {
    id: 'property-123',
    address: '123 Rothschild Blvd',
    city: 'Tel Aviv',
    neighborhood: 'Center',
    price: 2500000,
    currency: 'ILS',
    rooms: 3,
    size: 85,
    floor: 3,
    type: 'APARTMENT',
    description: 'Beautiful apartment in the heart of Tel Aviv',
    amenities: 'Elevator, Parking, Balcony',
    yearBuilt: 2010,
    agentName: 'John Doe',
    provider: 'YAD2',
  };

  const mockPropertyScoreResponse = {
    score: 85,
    category: 'excellent',
    reasons: [
      'מיקום מעולה בלב תל אביב',
      'מחיר תחרותי למטר',
      'בניין חדש יחסית עם מעלית'
    ],
    marketInsights: [
      'השכונה בגדילה מתמדת',
      'ביקוש גבוה לדירות באזור',
      'פוטנציאל השבחה טוב'
    ],
    recommendations: [
      'מתאים להשקעה',
      'כדאי לבדוק דירות דומות באזור',
      'לשקול משא ומתן על המחיר'
    ]
  };

  beforeEach(async () => {
    process.env.OPENAI_API_KEY = 'test-api-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  describe('scoreProperty', () => {
    beforeEach(() => {
      mockOpenAIResponses.create.mockResolvedValue({
        output_text: JSON.stringify(mockPropertyScoreResponse),
      });
    });

    it('should score a property successfully', async () => {
      const result = await service.scoreProperty(mockProperty);

      expect(result).toEqual(mockPropertyScoreResponse);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(['excellent', 'good', 'fair', 'poor']).toContain(result.category);
      expect(result.reasons).toBeInstanceOf(Array);
      expect(result.marketInsights).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('should call OpenAI with correct parameters', async () => {
      await service.scoreProperty(mockProperty);

      expect(mockOpenAIResponses.create).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        input: JSON.stringify({
          address: mockProperty.address,
          city: mockProperty.city,
          neighborhood: mockProperty.neighborhood,
          price: mockProperty.price,
          currency: mockProperty.currency,
          rooms: mockProperty.rooms,
          size: mockProperty.size,
          floor: mockProperty.floor,
          type: mockProperty.type,
          description: mockProperty.description,
          amenities: mockProperty.amenities,
          yearBuilt: mockProperty.yearBuilt,
          agentName: mockProperty.agentName,
          provider: mockProperty.provider,
        }),
        instructions: expect.stringContaining('Israeli real estate property'),
        text: {
          format: {
            type: 'json_schema',
            name: 'property_score',
            schema: expect.objectContaining({
              type: 'object',
              properties: expect.objectContaining({
                score: expect.objectContaining({
                  type: 'number',
                  minimum: 0,
                  maximum: 100,
                }),
                category: expect.objectContaining({
                  type: 'string',
                  enum: ['excellent', 'good', 'fair', 'poor'],
                }),
              }),
              required: ['score', 'category', 'reasons', 'marketInsights', 'recommendations'],
            }),
            strict: true,
          },
        },
        temperature: 0.3,
      });
    });

    it('should categorize scores correctly', async () => {
      // Test excellent category
      mockOpenAIResponses.create.mockResolvedValue({
        output_text: JSON.stringify({ ...mockPropertyScoreResponse, score: 90, category: 'excellent' }),
      });
      let result = await service.scoreProperty(mockProperty);
      expect(result.category).toBe('excellent');

      // Test good category
      mockOpenAIResponses.create.mockResolvedValue({
        output_text: JSON.stringify({ ...mockPropertyScoreResponse, score: 75, category: 'good' }),
      });
      result = await service.scoreProperty(mockProperty);
      expect(result.category).toBe('good');

      // Test fair category
      mockOpenAIResponses.create.mockResolvedValue({
        output_text: JSON.stringify({ ...mockPropertyScoreResponse, score: 60, category: 'fair' }),
      });
      result = await service.scoreProperty(mockProperty);
      expect(result.category).toBe('fair');

      // Test poor category
      mockOpenAIResponses.create.mockResolvedValue({
        output_text: JSON.stringify({ ...mockPropertyScoreResponse, score: 30, category: 'poor' }),
      });
      result = await service.scoreProperty(mockProperty);
      expect(result.category).toBe('poor');
    });

    it('should handle missing OPENAI_API_KEY', async () => {
      delete process.env.OPENAI_API_KEY;

      await expect(service.scoreProperty(mockProperty)).rejects.toThrow('OPENAI_API_KEY is missing');
    });

    it('should handle API errors with fallback scoring', async () => {
      mockOpenAIResponses.create.mockRejectedValue(new Error('API error'));

      const result = await service.scoreProperty(mockProperty);

      expect(result.score).toBe(50);
      expect(result.category).toBe('fair');
      expect(result.reasons).toEqual(['שגיאה בניתוח הנכס']);
      expect(result.marketInsights).toEqual(['לא ניתן לקבל תובנות שוק כעת']);
      expect(result.recommendations).toEqual(['נסה שוב מאוחר יותר']);
    });

    it('should handle invalid JSON response with fallback', async () => {
      mockOpenAIResponses.create.mockResolvedValue({
        output_text: 'invalid json response',
      });

      const result = await service.scoreProperty(mockProperty);

      expect(result.score).toBe(50);
      expect(result.category).toBe('fair');
      expect(result.reasons).toEqual(['לא ניתן לנתח את הנכס באופן מלא']);
    });

    it('should handle properties with minimal data', async () => {
      const minimalProperty = {
        address: 'Unknown',
        city: 'Tel Aviv',
        price: 1000000,
      };

      await service.scoreProperty(minimalProperty);

      expect(mockOpenAIResponses.create).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.stringContaining('"address":"Unknown"'),
        })
      );
    });

    it('should handle Hebrew property data correctly', async () => {
      const hebrewProperty = {
        ...mockProperty,
        address: 'רחוב בן יהודה 10',
        city: 'תל אביב',
        neighborhood: 'מרכז העיר',
        description: 'דירה יפה במרכז תל אביב',
        amenities: 'מעלית, חניה, מרפסת',
      };

      await service.scoreProperty(hebrewProperty);

      expect(mockOpenAIResponses.create).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.stringContaining('רחוב בן יהודה 10'),
        })
      );
    });

    it('should validate score range in response', async () => {
      // Test invalid high score
      mockOpenAIResponses.create.mockResolvedValue({
        output_text: JSON.stringify({ ...mockPropertyScoreResponse, score: 150 }),
      });

      // The service should either handle this in validation or the schema should prevent it
      await expect(service.scoreProperty(mockProperty)).rejects.toThrow();
    });

    it('should handle concurrent scoring requests', async () => {
      const properties = [mockProperty, { ...mockProperty, id: 'property-456' }];

      const promises = properties.map(prop => service.scoreProperty(prop));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual(mockPropertyScoreResponse);
      expect(results[1]).toEqual(mockPropertyScoreResponse);
      expect(mockOpenAIResponses.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('parseDefaults (Shopify integration)', () => {
    const mockShopifyDefaults = {
      vendor: 'Test Vendor',
      price: 99.99,
      inventoryQty: 10,
      inventoryPolicy: 'deny',
      requiresShipping: true,
      taxable: true,
      fulfillment: 'manual',
      status: 'active',
      weightUnit: 'kg',
      productType: 'Electronics',
      productCategory: 'Gadgets',
      tags: 'new, featured',
      published: true,
    };

    beforeEach(() => {
      mockOpenAIResponses.create.mockResolvedValue({
        output_text: JSON.stringify(mockShopifyDefaults),
      });
    });

    it('should parse Shopify product defaults', async () => {
      const inputText = 'Electronics product, priced at $99.99, in stock';

      const result = await service.parseDefaults(inputText);

      expect(result).toEqual(mockShopifyDefaults);
    });

    it('should handle empty input', async () => {
      const result = await service.parseDefaults('');

      expect(result).toEqual({});
    });

    it('should handle null/undefined input', async () => {
      const result1 = await service.parseDefaults(null as any);
      const result2 = await service.parseDefaults(undefined as any);

      expect(result1).toEqual({});
      expect(result2).toEqual({});
    });

    it('should enforce strict JSON schema', async () => {
      await service.parseDefaults('test input');

      expect(mockOpenAIResponses.create).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        input: 'test input',
        instructions: 'Parse the input into Shopify product defaults strictly matching the schema.',
        text: {
          format: {
            type: 'json_schema',
            name: 'shopify_defaults',
            schema: expect.objectContaining({
              type: 'object',
              additionalProperties: false,
              required: expect.arrayContaining([
                'vendor',
                'price',
                'inventoryQty',
                'inventoryPolicy',
                'requiresShipping',
                'taxable',
                'fulfillment',
                'status',
                'weightUnit',
                'productType',
                'productCategory',
                'tags',
                'published',
              ]),
            }),
            strict: true,
          },
        },
        temperature: 0.2,
      });
    });
  });

  describe('generatePerItem (Product generation)', () => {
    const mockItems = [
      { filename: 'silver-necklace.jpg' },
      { filename: 'gold-ring.jpg' },
      { filename: 'שרשרת-פנינים-צבעונית.jpg' },
    ];

    const mockGeneratedItems = [
      {
        filename: 'silver-necklace.jpg',
        title: 'שרשרת כסף אלגנטית',
        description: '<p>שרשרת כסף יפהפייה במיוחד.</p>',
        tags: 'תכשיטים, כסף, שרשראות',
        color: 'silver',
      },
      {
        filename: 'gold-ring.jpg',
        title: 'טבעת זהב קלאסית',
        description: '<p>טבעת זהב במראה קלאסי.</p>',
        tags: 'תכשיטים, זהב, טבעות',
        color: 'gold',
      },
      {
        filename: 'שרשרת-פנינים-צבעונית.jpg',
        title: 'שרשרת פנינים צבעונית',
        description: '<p>שרשרת פנינים בצבעים מגוונים.</p>',
        tags: 'תכשיטים, פנינים, צבעוני',
        color: 'multi',
      },
    ];

    beforeEach(() => {
      mockOpenAIResponses.create.mockResolvedValue({
        output_text: JSON.stringify({ items: mockGeneratedItems }),
      });
    });

    it('should generate product details for multiple items', async () => {
      const result = await service.generatePerItem(mockItems);

      expect(result).toEqual(mockGeneratedItems);
      expect(result).toHaveLength(3);
    });

    it('should handle empty items array', async () => {
      const result = await service.generatePerItem([]);

      expect(result).toEqual([]);
    });

    it('should detect colorful pearl necklaces correctly', async () => {
      const result = await service.generatePerItem(mockItems);

      const colorfulItem = result.find(item => item.filename.includes('צבעונית'));
      expect(colorfulItem?.color).toBe('multi');
    });

    it('should use Hebrew text generation', async () => {
      await service.generatePerItem(mockItems);

      expect(mockOpenAIResponses.create).toHaveBeenCalledWith(
        expect.objectContaining({
          instructions: expect.stringContaining('Hebrew'),
        })
      );
    });

    it('should handle API quota exceeded with fallback', async () => {
      mockOpenAIResponses.create.mockRejectedValue({ status: 429 });

      const result = await service.generatePerItem(mockItems);

      expect(result).toHaveLength(3);
      expect(result[0].title).toBe('silver necklace');
      expect(result[0].description).toBe('<p>תיאור יתווסף מאוחר יותר.</p>');
      expect(result[0].color).toBe('silver');
    });

    it('should enforce required schema fields', async () => {
      await service.generatePerItem(mockItems);

      expect(mockOpenAIResponses.create).toHaveBeenCalledWith(
        expect.objectContaining({
          text: {
            format: {
              type: 'json_schema',
              name: 'shopify_ai_items',
              schema: expect.objectContaining({
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: expect.objectContaining({
                      type: 'object',
                      required: ['filename', 'title', 'description', 'tags', 'color'],
                    }),
                  },
                },
                required: ['items'],
              }),
              strict: true,
            },
          },
        })
      );
    });
  });

  describe('error handling and resilience', () => {
    it('should handle network timeouts', async () => {
      mockOpenAIResponses.create.mockRejectedValue(new Error('ETIMEDOUT'));

      const result = await service.scoreProperty(mockProperty);

      expect(result.score).toBe(50);
      expect(result.category).toBe('fair');
    });

    it('should handle rate limiting gracefully', async () => {
      mockOpenAIResponses.create.mockRejectedValue({ status: 429, message: 'Rate limit exceeded' });

      const result = await service.scoreProperty(mockProperty);

      expect(result).toBeDefined();
      expect(result.reasons).toContain('שגיאה בניתוח הנכס');
    });

    it('should log errors appropriately', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockOpenAIResponses.create.mockRejectedValue(new Error('Test error'));

      await service.scoreProperty(mockProperty);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AI] Property scoring failed:'),
        expect.any(String),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });
  });
});