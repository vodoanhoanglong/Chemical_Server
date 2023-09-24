import { IRequest } from "../../types";

export interface IContext<I> {
  currentUser: I;
  req: IRequest;
}
