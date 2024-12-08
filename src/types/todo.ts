export interface Todo {
	id: string;
	title: string;
	completed: boolean;
	priority: 'low' | 'medium' | 'high';
	order: number;
}

export interface AddTodoRequest {
	title: string;
	priority?: 'low' | 'medium' | 'high';
}

export interface UpdateTodoRequest {
	id: string;
	completed?: boolean;
	priority?: 'low' | 'medium' | 'high';
	order?: number;
}