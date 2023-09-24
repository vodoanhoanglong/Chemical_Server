import { LangType } from "../../types";

export interface ITemplateError<IContent = Record<string, string>> {
  params?: {
    content?: IContent;
  };
  lang?: LangType;
}

export interface IResourceError {
  content: string;
}

export enum ErrorKey {
  PermissionDenied = "permission_denied",
  ExceptionVerifyFirebase = "exception_verify_firebase",
  EventNotFound = "event_not_found",
  InvalidParams = "invalid_params",
  UnknownError = "unknown_error",

  // Auth
  UnAuthentication = "un_authentication",
  NotMatchOtp = "not_match_otp",
  LimitRequestOtp = "limit_request_otp",
  ExpiredOtp = "expired_otp",
  PreventSpam = "prevent_spam",
  PhoneExisted = "phone_existed",
  ThirdPartyExisted = "third_party_existed",
  EmailExisted = "email_existed",
  SessionOtp = "session_otp",
  NotAuthOtherService = "not_auth_other_service",
  AuthOtherServiceExisted = "auth_other_service_existed",
  PreventRoleAuthFormOtherService = "prevent_role_auth_other_service",
  NotAddressOtherService = "not_address_other_service",
  SystemMaintenance = "system_maintenance",
  InvalidToken = "invalid_token",
  PasswordNotFound = "password_not_found",
  CurrentUserNotFound = "current_user_not_found",
  PasswordAlreadyExist = "password_already_exist",
  EmailNotFound = "email_not_found",
  IdentityCardExisted = "identity_card_existed",
  CustomerNotFound = "customer_not_found",
  AccountBlocked = "account_blocked",
  InvalidEmailOrPassword = "invalid_email_or_password",
  TokenExpired = "token_expired",
}
