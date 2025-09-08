export type Audience = {
  ageMin?: number;
  ageMax?: number;
  locations?: string[];
  interests?: string[];
  genders?: ('male' | 'female' | 'all')[];
  languages?: string[];
};

export class CreateCampaignDto {
  goal!: string;           // required
  copy!: string;           // required
  image?: string | null;   // url
  audience?: Audience;     // stored as JSON
  platform?: string | null;// 'facebook' | 'instagram' | 'google' (optional for now)
  status?: 'DRAFT' | 'READY' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
}
