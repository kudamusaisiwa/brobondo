export interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: number;
  mentions?: { [key: string]: string }; // userId: userName
  reactions?: { [key: string]: string[] }; // emoji: userIds
  attachment?: {
    type: 'customer' | 'order' | 'payment';
    id: string;
    title: string;
    subtitle?: string;
    amount?: number;
  };
}