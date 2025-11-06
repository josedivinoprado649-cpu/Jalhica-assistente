export interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
}

export interface Visitation {
  id: string;
  date: string;
  time?: string;
  client: string;
  address: string;
  reason: string;
  notes?: string;
}

export interface TranscriptEntry {
  id: string;
  role: 'user' | 'model' | 'tool';
  text: string;
}