

export type User = {
  id: string;
  fullName: string;
  email: string;
  registrationDate: string;
  profileUrl: string;
  isVerified: boolean;
  experience: string;
  education: string;
  userType: string;
  location: string;
  cvUrl: string;
  accountState: 'Activa' | 'Desactivada';
  // Optional fields that might be null
  commercialName?: string;
  industry?: string;
  description?: string;
};

export type FirebaseUser = {
  uid: string;
  nombre_completo: string;
  email: string;
  tiempo_registro: number;
  fotoPerfilUrl: string;
  usuario_verificado?: boolean;
  experiencia?: string;
  formacion?: string;
  tipoUsuario?: string;
  ubicacion?: string;
  cvUrl?: string;
  estadoCuenta?: 'Activa' | 'Desactivada';
  nombreComercial?: string;
  rubro?: string;
  descripcion?: string;
};


export type Company = {
  id: string;
  name: string;
  industry: string;
  location: string;
  foundedDate: string;
  website: string;
};

export type EmployerProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export type JobOffer = {
  id: string;
  title: string;
  employer: EmployerProfile;
  location:string;
  modality: string;
  approxPayment: string;
  postedDate: string;
  deadline?: string;
  status: 'Activa' | 'Cerrada';
};

export type FirebaseJobOffer = {
  cargo: string;
  createdAt: number;
  descripcion: string;
  employerId: string;
  estado: 'ACTIVA' | 'CERRADA';
  id: string;
  modalidad: string;
  pago_aprox: string;
  ubicacion: string;
  fecha_limite?: number;
}

// Data types for Postulations
export type FirebasePostulation = {
    id: string;
    postulanteId: string;
    offerId: string;
    fechaPostulacion: number; 
    estado_postulacion?: 'Enviada' | 'Revisada' | 'Rechazada' | 'Aceptada' | 'pendiente'; 
}

export type ApplicantProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export type Postulation = {
    id: string;
    applicant: ApplicantProfile;
    offer: JobOffer;
    postulationDate: string;
    postulationStatus: string;
}
