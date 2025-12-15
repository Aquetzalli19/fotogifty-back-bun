import { Store } from '../entities/store.entity';

export interface StoreRepositoryPort {
  findById(id: number): Promise<Store | null>;
  findByEmail(email: string): Promise<Store | null>;
  findByCodigoEmpleado(codigo: string): Promise<Store | null>;
  save(store: Store): Promise<Store>;
  findAll(): Promise<Store[]>;
  update(store: Store): Promise<Store>;
  delete(id: number): Promise<boolean>;
}