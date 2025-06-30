export interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    subscription: SubscriptionType;
    password: string;
    csvFile: File;
}

export type SubscriptionType = 'Basic' | 'Advanced' | 'Pro';

export interface CsvData {
    headers: string[];
    rows: string[][];
    fileName: string;
}
