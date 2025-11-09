import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { z } from 'zod';

const publicLeadSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  employeeCount: z.enum(['1-10', '11-50', '51-200', '200+'], {
    errorMap: () => ({ message: 'Please select employee count' })
  }),
  industry: z.string().min(1, 'Industry is required'),
  purpose: z.string().min(10, 'Please provide at least 10 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = publicLeadSchema.parse(body);

    // Save to database
    const publicLead = await prisma.publicLead.create({
      data: validatedData,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you! We will contact you soon.',
        id: publicLead.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Error creating public lead:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
