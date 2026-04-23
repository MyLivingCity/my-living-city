export interface ISegment {
  segId: number;
  parentId: number;
  parentSegment?: ISegment;
  name: string;
  country: string;
  province: string;
  lat: number;
  lon: number;
  radius: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubSegment {
  id: number;
  segId: number;
  name: string;
  lat: number;
  lon: number;
  radius: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CheckBoxItem = {
  label: string | undefined;
  value: number | "SuperSeg";
  children?: CheckBoxItem[];
};
