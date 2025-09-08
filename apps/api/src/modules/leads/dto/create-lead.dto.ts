export type CreateLeadDto = {
  name?: string;            // חובה בסכמה – נשים דיפולט בשירות אם חסר
  email?: string | null;
  phone?: string | null;
  interest?: string | null;
  budget?: number | null;
  score?: number | null;
  bucket?: string | null;
  status?: string;          // בסכמה זה string עם דיפולט "new"
  source?: string;          // דיפולט DB: "website"
  utm?: any;                // Json?
  consent?: boolean;        // דיפולט DB: true
};
