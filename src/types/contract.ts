export type Section = {
  id: string;
  number: string;
  title: string;
  text: string;
  startOffset: number;
  endOffset: number;
};

export type Contract = {
  id: string;
  sessionId: string;
  filename: string;
  mimeType: string;
  pageCount: number;
  text: string;
  sections: Section[];
  createdAt: string;
};
