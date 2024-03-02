interface BaseResponse {
    success: boolean;
    message?: string;
    errors?: string[];
    payload?: any;
}

export default BaseResponse;
