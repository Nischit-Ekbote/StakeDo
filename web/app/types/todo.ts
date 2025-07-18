export interface todo{
    pubkey: string;
    todoId: string;
    authority: string;
    createdAt: number | null;
    title: string;
    description: string;
    deadline: number | null; 
    updatedAt: string | null; 
    isCompleted: boolean;
}
