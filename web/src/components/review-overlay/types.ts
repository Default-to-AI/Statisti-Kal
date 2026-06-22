export type ReviewMode = 'comment' | 'edit' | 'style' | null;

export type ReviewCommentEntry = {
  id: string;
  label: string;
  comment: string;
  updatedAt: string;
};

export type ReviewTextEntry = {
  id: string;
  label: string;
  value: string;
  updatedAt: string;
};

export type ReviewTargetRecord = {
  id: string;
  label: string;
};

export type ReviewStyleTargetType = 'block' | 'text';

export type ReviewStyleEntry = {
  id: string;
  label: string;
  targetType: ReviewStyleTargetType;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  padding?: string;
  updatedAt: string;
};

export type ReviewStorageShape = {
  comments: Record<string, ReviewCommentEntry>;
  textEdits: Record<string, ReviewTextEntry>;
  styleEdits: Record<string, ReviewStyleEntry>;
};
