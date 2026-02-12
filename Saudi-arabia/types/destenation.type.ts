export interface Destenation {
    id: number;
    title: string;
    description: string;
    image: string;
    href: string;
    traveler: {
        image: string;
        name: string;
        status: string;
    }
}