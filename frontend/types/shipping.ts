export interface ShippingDestination {
    id: number;
    label: string;
    province_name: string;
    city_name: string;
    district_name: string;
    subdistrict_name: string;
    zip_code: string;
}

export interface ShippingOption {
    name: string
    code: string;
    service: string;
    description: string;
    cost: number;
    etd: string;
}