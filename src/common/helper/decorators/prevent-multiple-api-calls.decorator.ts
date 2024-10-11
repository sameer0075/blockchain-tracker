import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/**
 * Interceptor to prevent multiple API calls with the same request ID.
 * Requests with the same request ID will be rejected with a ConflictException.
 */
@Injectable()
export class PreventMultipleClicksInterceptor implements NestInterceptor {
  /**
   * Set to keep track of ongoing requests.
   * The unique identifier for each request is the request ID.
   */
  private ongoingRequests: Set<string> = new Set();

  /**
   * Intercepts the incoming request and checks if the request ID is already in the ongoing requests set.
   * If it is, it throws a ConflictException.
   * If it's not, it adds the request ID to the ongoing requests set.
   * It then proceeds to call the next handler in the chain and removes the request ID from the ongoing requests set once the response is received.
   * If an error occurs, it removes the request ID from the ongoing requests set before rethrowing the error.
   * @param context The execution context of the incoming request.
   * @param next The next handler in the chain.
   * @returns An observable of the response.
   */
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const requestId = request.id;

    if (this.ongoingRequests.has(requestId)) {
      // Request is already in process, throw a ConflictException
      return throwError(
        () => new UnauthorizedException('Wait! Request is already in process'),
      );
    }

    this.ongoingRequests.add(requestId);

    return next.handle().pipe(
      tap(() => {
        // Remove the request from the ongoing requests set once the response is received
        this.ongoingRequests.delete(requestId);
      }),
      catchError((error) => {
        // Remove the request from the ongoing requests set in case of an error
        this.ongoingRequests.delete(requestId);
        return throwError(error);
      }),
    );
  }
}
