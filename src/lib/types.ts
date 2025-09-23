export type User = {
  id: string;
  fullName: string;
  email: string;
  registrationDate: string;
  profileUrl: string;
  isVerified: boolean;
  lastStateChange?: string;
  experience: string;
  education: string;
  userType: string;
  location: string;
  cvUrl: string;
};

export type FirebaseUser = {
  uid: string;
  nombre_completo: string;
  email: string;
  tiempo_registro: number;
  fotoPerfilUrl: string;
  usuario_verificado?: boolean; // Corresponds to isVerified
  experiencia?: string;
  formacion?: string;
  tipoUsuario?: string;
  ubicacion?: string;
  cvUrl?: string;
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
