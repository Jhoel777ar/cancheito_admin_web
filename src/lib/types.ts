export type User = {
  id: string;
  fullName: string;
  email: string;
  registrationDate: string;
  profileUrl: string;
  isVerified: boolean;
  lastStateChange?: string;
};

export type FirebaseUser = {
  uid: string;
  nombre_completo: string;
  email: string;
  tiempo_registro: number;
  fotoPerfilUrl: string;
  isVerified: boolean; // Assuming you'll manage this state
};


export type Company = {
  id: string;
  name: string;
  industry: string;
  location: string;
  foundedDate: string;
  website: string;
};

export type JobOffer = {
  id: string;
  title: string;
  companyName: string;
  location:string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  postedDate: string;
  status: 'Open' | 'Closed';
};
