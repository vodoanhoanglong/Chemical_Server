import { Response } from "express";
import moment from "moment-timezone";
import { responseError } from "../../helpers";
import { IDate } from "../../models";
import { ErrorKey } from "../../resources";
import { callApi } from "../../services";
import { IModelStatic, IRequest, Role } from "../../types";

export enum HasuraHeader {
  UserId = "x-hasura-user-id",
  Role = "x-hasura-role",
  AdminSecret = "x-hasura-admin-secret",
}

export interface IHasuraAction<Input = Record<string, any>> {
  session_variables: Record<string, string>;
  input: Input;
  action: {
    name: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IHandler<P = Record<string, unknown>> = (content: IContextHandler<P>) => Promise<any> | any;
export type ITrigger<M = IModelStatic> = {
  readonly new: M;
  readonly old: M;
};
export type IAction<M> = {
  readonly form: M;
};
export type ICronjob = {
  readonly schedule_time: string;
  readonly payload: Record<string, unknown>;
  readonly name: string;
  readonly id: string;
};

export type IScheduledEvent<M> = {
  readonly id: string;
  readonly created_at: string;
  readonly scheduled_time: string;
  readonly payload: M;
};

export type ISessionVariable = {
  readonly currentUserId: string;
  readonly role: Role;
};

export type IContextHandler<P> = {
  readonly req: IRequest;
  readonly res: Response;
  readonly op: string;
  readonly payload: P;
  readonly sessionVariables?: ISessionVariable;
};

export enum OperandType {
  Insert = "INSERT",
  Update = "UPDATE",
  Delete = "DELETE",
}

export function wrapperHandler(
  handler: IHandler[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: (body: Record<string, any>) => {
    name: string;
    data: Record<string, unknown>;
    op?: OperandType;
    sessionVariables?: ISessionVariable;
  },
) {
  return async (req: IRequest, res: Response) => {
    try {
      const { name, data, op, sessionVariables } = info(req.body);
      const currentHandler = handler?.find((e) => e.name === name);

      if (!currentHandler) {
        return responseError(req, res, ErrorKey.EventNotFound, {
          params: { eventName: name },
          statusCode: 400,
        });
      }
      const resp = await currentHandler({ req, res, op, payload: data, sessionVariables });

      return res.json(resp);
    } catch (error) {
      return responseError(req, res, error);
    }
  };
}
export function parseSessionVariable(data: Record<string, string>): ISessionVariable {
  return {
    currentUserId: data ? data[HasuraHeader.UserId] : null,
    role: data ? (data[HasuraHeader.Role] as Role) : null,
  };
}

export enum HasuraEventType {
  CreateScheduledEvent = "create_scheduled_event",
  DeleteScheduledEvent = "delete_scheduled_event",
}

type RetryConf = {
  num_retries: number;
  timeout_seconds: number;
  tolerance_seconds: number;
  retry_interval_seconds: number;
};

type ArgsCreateScheduledEvent = {
  webhook: string;
  schedule_at: string;
  payload: Record<string, unknown>;
  headers?: Array<object>;
  retry_conf?: RetryConf;
  comment?: string;
};

type ArgsDeleteScheduledEvent = {
  type: string;
  event_id: string;
};

type RespCreateScheduledEvent = {
  message: string;
  event_id: string;
};

type PayloadCreateScheduledEvent = {
  type: HasuraEventType;
  args: ArgsCreateScheduledEvent | ArgsDeleteScheduledEvent;
};

export type IBaseConfigScheduledEvent = {
  baseURL: string;
  webhook?: string;
  hasuraRole?: string;
  hasuraSecret: string;
};

export const ContentType = "Content-Type";
export const ContentTypeJson = "application/json";
export const BaseConfigScheduledEvent: IBaseConfigScheduledEvent = {
  baseURL: `http://data:8080`,
  hasuraSecret: process.env.HASURA_GRAPHQL_ADMIN_SECRET,
};

export async function createScheduleEvent(payload: Record<string, unknown>, scheduleAt: IDate, webhook: string) {
  return callApi<RespCreateScheduledEvent, PayloadCreateScheduledEvent>({
    baseURL: BaseConfigScheduledEvent.baseURL,
    url: "/v1/metadata",
    method: "POST",
    headers: {
      [ContentType]: ContentTypeJson,
      [HasuraHeader.AdminSecret]: BaseConfigScheduledEvent.hasuraSecret,
    },
    data: {
      type: HasuraEventType.CreateScheduledEvent,
      args: {
        webhook,
        schedule_at: moment(scheduleAt).toISOString(),
        payload,
      },
    },
  });
}

export async function deleteScheduleEvent(eventId: string) {
  return callApi<RespCreateScheduledEvent, PayloadCreateScheduledEvent>({
    baseURL: BaseConfigScheduledEvent.baseURL,
    url: "/v1/metadata",
    method: "POST",
    headers: {
      [ContentType]: ContentTypeJson,
      [HasuraHeader.Role]: BaseConfigScheduledEvent.hasuraRole,
    },
    data: {
      type: HasuraEventType.DeleteScheduledEvent,
      args: {
        type: "one_off",
        event_id: eventId,
      },
    },
  });
}
