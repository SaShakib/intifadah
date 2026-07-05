export interface CommentThread {
  id: string;
  subject: string;
  lastMessage: string;
  status: 'answered' | 'pending';
  date: string;
}
