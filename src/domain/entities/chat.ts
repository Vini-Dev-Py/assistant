export interface Chat {
  id: number;
  title: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewChat {
  title: string;
  userId: number;
}
