export interface todo{
    pubkey: string;
    todoId: string;
    authority: string;
    createdAt: string | null;
    title: string;
    description: string;
    deadline: string | null; 
    updatedAt: string | null; 
    isCompleted: boolean;
}
