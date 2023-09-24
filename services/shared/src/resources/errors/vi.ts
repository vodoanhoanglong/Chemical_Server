import { ErrorKey } from "./type";

export default {
  [ErrorKey.ExceptionVerifyFirebase]: "Lỗi xác thực bên phía hệ thống thứ 3",
  [ErrorKey.EventNotFound]: "Event {{eventName}} không tìm thấy",

  // Auth
  [ErrorKey.PreventSpam]: "Quá nhiều yêu cầu liên tiếp, vui lòng thử lại sau {{time}} giây!",
  [ErrorKey.LimitRequestOtp]: "Bạn đã bị chặn lấy mã OTP vì spam",
  [ErrorKey.NotMatchOtp]: "Mã OTP không chính xác",
  [ErrorKey.ExpiredOtp]: "Mã OTP đã hết hạn",
  [ErrorKey.PhoneExisted]: "Số điện thoại đã tồn tại",
  [ErrorKey.EmailExisted]: "Địa chỉ email đã tồn tại",
  [ErrorKey.ThirdPartyExisted]:
    "Email không trùng khớp, vui lòng nhấn vào Hỗ trợ Zalo để được cập nhật lại thông tin email đăng nhập",
  [ErrorKey.SessionOtp]: "Không thể định danh thiết bị",
  [ErrorKey.NotAuthOtherService]: "Không thể xác thực với hệ thống khác",
  [ErrorKey.AuthOtherServiceExisted]: "Tài khoản đã tồn tại hoặc có thể tài khoản đã xoá khỏi hệ thống",
  [ErrorKey.PreventRoleAuthFormOtherService]: "Tài khoản không có quyền đăng nhập",
  [ErrorKey.NotAddressOtherService]: "Vui lòng cập nhật đầy đủ địa chỉ của KTV/Đại lý",
  [ErrorKey.SystemMaintenance]: "Hệ thống đang bảo trì, vui lòng thử lại sau!",
  [ErrorKey.IdentityCardExisted]: "Số CMND/CCCD đã tồn tại",
  [ErrorKey.PermissionDenied]: "Bạn không có quyền truy cập",

  [ErrorKey.EmailNotFound]: "Email không tồn tại",

  [ErrorKey.InvalidEmailOrPassword]: "Email hoặc mật khẩu không chính xác",
} as Record<ErrorKey, string>;
