import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { v4 as uuidv4 } from 'uuid';

export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  order?: number;
} 

export interface AddTodoRequest {
  title: string;
  priority: Priority;
  order: number;
}

export interface UpdateTodoRequest {
  id: string;
  completed?: boolean;
  order?: number;
  title?: string;
  priority?: Priority;
}

export const api = createApi({
  reducerPath: 'todoApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://6535e23ac620ba9358ecbf47.mockapi.io',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      headers.set('Access-Control-Allow-Origin', '*');
      return headers;
    },
  }),
  tagTypes: ['Todos'],
  endpoints: (builder) => ({
    getTodos: builder.query<Todo[], void>({
      query: () => '/todos',
      providesTags: ['Todos'],
      transformResponse: (response: Todo[]) => {
        const sorted = [...response].sort((a: Todo, b: Todo) => (a.order || 0) - (b.order || 0));
        return sorted.map((todo: Todo, index: number) => ({ ...todo, order: index }));
      },
    }),
    addTodo: builder.mutation<Todo, AddTodoRequest>({
      query: (todo) => ({
        url: '/todos',
        method: 'POST',
        body: { 
          ...todo, 
          completed: false, 
          order: 99999
        },
      }),
      invalidatesTags: ['Todos'],
      async onQueryStarted(newTodo, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          api.util.updateQueryData('getTodos', undefined, (draft) => {
            draft.push({ 
              id: uuidv4(), 
              ...newTodo, 
              completed: false, 
              order: draft.length,
              priority: newTodo.priority || 'medium'
            });
          })
        );
        try {
          await queryFulfilled;
        } catch (err) {
          console.error('Failed to add todo:', err);
          patchResult.undo();
        }
      },
    }),
    updateTodo: builder.mutation<Todo, UpdateTodoRequest>({
      query: ({ id, ...updates }) => ({
        url: `/todos/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Todos'],
      async onQueryStarted({ id, ...updates }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          api.util.updateQueryData('getTodos', undefined, (draft) => {
            const todo = draft.find((t) => t.id === id);
            if (todo) {
              Object.assign(todo, updates);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch (err) {
          console.error('Failed to update todo:', err);
          patchResult.undo();
        }
      },
    }),
    deleteTodo: builder.mutation<void, string>({
      query: (id) => ({
        url: `/todos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Todos'],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          api.util.updateQueryData('getTodos', undefined, (draft) => {
            const index = draft.findIndex(todo => todo.id === id);
            if (index !== -1) {
              draft.splice(index, 1);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch (err) {
          console.error('Failed to delete todo:', err);
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetTodosQuery,
  useAddTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} = api;