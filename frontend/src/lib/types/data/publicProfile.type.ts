export enum LinkType {
    WEBSITE = "WEBSITE",
    TWITTER = "TWITTER",
    FACEBOOK = "FACEBOOK",
    INSTAGRAM = "INSTAGRAM",
    LINKEDIN = "LINKEDIN",
    YOUTUBE = "YOUTUBE",
    TIKTOK = "TIKTOK",
    OTHER = "OTHER",
}

export interface Link {
    id: number;
    link: string;
    linkType: LinkType;
    createdAt: Date;
    public_community_business_profile_id?: number;
    public_municipal_profile_id?: number;
}

export interface PublicStandardProfile {
    id: string;
    email: string;
    fname: string;
    lname: string;
}

export interface PublicCommunityBusinessProfile {
    userId: string;
    statement: string;
    description: string;
    links: Object[];
    address: string;
    contactEmail: string;
    contactPhone: string;
}

export interface PublicMunicipalProfile {
    userId: string;
    statement: string;
    responsibility: string;
    links: Object[];
    address: string;
    contactEmail: string;
    contactPhone: string;
}