export interface ClientProfileResponseDTO {
    id: string;
    userId: string;
    name: string;
    surname: string;
    email: string;
    phoneNumber?: string;
    profileImage?: string;
    street?: string;
    addressDetails?: string;
    city?: string;
    zipCode?: string;
}

export interface UpdateClientRequestDTO {
    name?: string;
    surname?: string;
    phoneNumber?: string;
    profileImage?: string; // base64 or url
    street?: string;
    city?: string;
    addressDetails?: string;
    zipCode?: string;
}