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

export interface PublicCommunityBusinessProfile {
    id: number;
    userId: number;
    statement: string;
    description: string;
    links: Link[];
    address: string;
    contactEmail: string;
    contactPhone: string;
    createdAt: Date;
    updatedAt: Date;
}