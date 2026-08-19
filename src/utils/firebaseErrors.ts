/**
 * Firebase Error Parser and Formatter
 * Translates Firebase Authentication and Firestore errors into clear, friendly, actionable toast messages.
 * Removes technical codes (e.g. auth/invalid-credential, auth/user-not-found) and replaces them with human-readable guidance.
 */

export interface ParsedFirebaseError {
  title: string;
  message: string;
  code?: string;
  operationType?: string;
  path?: string;
  details?: string;
  isPermissionError?: boolean;
  isQuotaError?: boolean;
}

/**
 * Strip technical Firebase prefixes and error codes from raw strings
 */
function sanitizeRawMessage(raw: string): string {
  if (!raw) return "An unexpected error occurred.";

  let cleaned = raw
    .replace(/^FirebaseError:\s*/i, "")
    .replace(/^Firebase:\s*Error\s*/i, "")
    .replace(/^Error:\s*/i, "")
    .replace(/\s*\([a-zA-Z0-9_\-\/]+\)\.?$/g, "")
    .replace(/\s*\(auth\/[a-zA-Z0-9_\-]+\)\.?/gi, "")
    .replace(/auth\/[a-zA-Z0-9_\-]+/gi, "")
    .trim();

  // If the result ended up empty or just punctuation
  if (!cleaned || cleaned === "." || cleaned === "()") {
    return "Please check your details and try again.";
  }

  // Capitalize first letter and ensure ending period
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  if (!cleaned.endsWith(".") && !cleaned.endsWith("!") && !cleaned.endsWith("?")) {
    cleaned += ".";
  }

  return cleaned;
}

/**
 * Parse any Firebase / JavaScript error into structured user-friendly content
 */
export function parseFirebaseError(
  error: unknown,
  fallbackMessage: string = "An unexpected error occurred. Please try again."
): ParsedFirebaseError {
  if (!error) {
    return {
      title: "Error",
      message: fallbackMessage,
    };
  }

  // 1. Check if error is a JSON string from handleFirestoreError (FirestoreErrorInfo)
  if (
    typeof error === "string" ||
    (error instanceof Error &&
      error.message.startsWith("{") &&
      error.message.includes('"operationType"'))
  ) {
    try {
      const rawJson = typeof error === "string" ? error : (error as Error).message;
      const parsed = JSON.parse(rawJson);
      if (parsed && typeof parsed === "object" && parsed.operationType) {
        const rawErr = parsed.error || "";
        const isPerm =
          rawErr.toLowerCase().includes("permission") ||
          rawErr.toLowerCase().includes("missing or insufficient permissions");
        const isQuota =
          rawErr.toLowerCase().includes("quota") ||
          rawErr.toLowerCase().includes("resource-exhausted");

        let title = "Database Update Failed";
        let message = `Unable to save changes to '${parsed.path || "your academic records"}'. Please try again.`;

        if (isPerm) {
          title = "Access Restricted";
          message = "You need to be signed in to perform this academic record action.";
        } else if (isQuota) {
          title = "Usage Limit Reached";
          message = "The daily database limit has been reached. Please try again shortly.";
        }

        return {
          title,
          message,
          operationType: parsed.operationType,
          path: parsed.path,
          isPermissionError: isPerm,
          isQuotaError: isQuota,
        };
      }
    } catch {
      // If JSON parsing fails, continue to standard error parsing
    }
  }

  const errObj = error as Record<string, any>;
  const rawMsg: string = (
    errObj?.message || (error instanceof Error ? error.message : String(error))
  ).trim();

  // Extract error code from property or from message string e.g. "auth/invalid-credential"
  let code: string | undefined = errObj?.code;
  if (!code && rawMsg) {
    const codeMatch =
      rawMsg.match(/\((auth\/[a-z0-9_\-]+)\)/i) ||
      rawMsg.match(/auth\/[a-z0-9_\-]+/i) ||
      rawMsg.match(/\((firestore\/[a-z0-9_\-]+)\)/i) ||
      rawMsg.match(/firestore\/[a-z0-9_\-]+/i);
    if (codeMatch) {
      code = (codeMatch[1] || codeMatch[0]).toLowerCase();
    }
  }

  // 2. Firebase Auth & Firestore Human-Friendly Mappings (NO raw codes shown to users)
  if (code) {
    const normalizedCode = code.toLowerCase();

    switch (normalizedCode) {
      // Authentication errors
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
      case "auth/invalid-login-credentials":
        return {
          title: "Incorrect Email or Password",
          message: "The email address or password you entered is incorrect. Please check your credentials and try again.",
        };

      case "auth/email-already-in-use":
      case "auth/email-already-exists":
        return {
          title: "Account Already Exists",
          message: "An account with this academic email address already exists. Please sign in instead.",
        };

      case "auth/weak-password":
        return {
          title: "Password Too Weak",
          message: "Your password must be at least 6 characters long.",
        };

      case "auth/invalid-email":
        return {
          title: "Invalid Email Format",
          message: "Please enter a valid university or personal email address (e.g. student@nust.edu.pk).",
        };

      case "auth/missing-password":
        return {
          title: "Password Required",
          message: "Please enter your account password to proceed.",
        };

      case "auth/missing-email":
        return {
          title: "Email Required",
          message: "Please enter your academic or personal email address.",
        };

      case "auth/user-disabled":
        return {
          title: "Account Suspended",
          message: "This account has been disabled. Please reach out to support or your academic administrator.",
        };

      case "auth/too-many-requests":
        return {
          title: "Too Many Attempts",
          message: "Too many unsuccessful attempts. Access is temporarily restricted. Please wait a few moments and try again.",
        };

      case "auth/network-request-failed":
        return {
          title: "Network Connection Issue",
          message: "Unable to connect to the server. Please check your internet connection and try again.",
        };

      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return {
          title: "Sign-In Cancelled",
          message: "The authentication window was closed before completing verification.",
        };

      case "auth/popup-blocked":
        return {
          title: "Pop-Up Blocked",
          message: "Your browser blocked the sign-in window. Please enable pop-ups for this site and try again.",
        };

      case "auth/requires-recent-login":
        return {
          title: "Re-Authentication Required",
          message: "For your security, please sign out and sign back in to perform this sensitive action.",
        };

      case "auth/operation-not-allowed":
        return {
          title: "Sign-In Method Unavailable",
          message: "This sign-in method is currently disabled in system settings.",
        };

      case "auth/internal-error":
        return {
          title: "Authentication Error",
          message: "An internal authentication issue occurred. Please check your network connection and retry.",
        };

      // Firestore Error Codes
      case "permission-denied":
      case "firestore/permission-denied":
        return {
          title: "Permission Denied",
          message: "You do not have permission to access or modify this academic record. Please ensure you are logged in.",
          isPermissionError: true,
        };

      case "unavailable":
      case "firestore/unavailable":
        return {
          title: "Service Temporarily Unavailable",
          message: "The academic database is temporarily unreachable. Please check your connection and retry.",
        };

      case "not-found":
      case "firestore/not-found":
        return {
          title: "Record Not Found",
          message: "The requested academic resource, course, or research report could not be found.",
        };

      case "already-exists":
      case "firestore/already-exists":
        return {
          title: "Record Already Exists",
          message: "An academic entry with this name or identifier already exists.",
        };

      case "resource-exhausted":
      case "firestore/resource-exhausted":
        return {
          title: "Daily Limit Reached",
          message: "The database service limit has been reached for today. Please try again tomorrow.",
          isQuotaError: true,
        };

      case "unauthenticated":
      case "firestore/unauthenticated":
        return {
          title: "Authentication Required",
          message: "Your session has expired. Please sign in again to continue.",
        };

      case "deadline-exceeded":
      case "firestore/deadline-exceeded":
        return {
          title: "Request Timed Out",
          message: "The request took too long to complete. Please check your internet connection and try again.",
        };

      case "cancelled":
      case "firestore/cancelled":
        return {
          title: "Request Cancelled",
          message: "The operation was cancelled.",
        };
    }
  }

  // 3. Fallback message inspection
  const lowerMsg = rawMsg.toLowerCase();
  if (lowerMsg.includes("missing or insufficient permissions")) {
    return {
      title: "Permission Denied",
      message: "You do not have authorization to perform this action. Please verify you are logged in.",
      isPermissionError: true,
    };
  }

  if (lowerMsg.includes("quota exceeded") || lowerMsg.includes("resource-exhausted")) {
    return {
      title: "Limit Reached",
      message: "The usage limit has been reached. Please try again later.",
      isQuotaError: true,
    };
  }

  if (lowerMsg.includes("client is offline") || lowerMsg.includes("network error") || lowerMsg.includes("failed to fetch")) {
    return {
      title: "Connection Offline",
      message: "You are currently working offline. Your changes will sync when connection is restored.",
    };
  }

  // Clean raw message of any Firebase error syntax
  const cleanMsg = sanitizeRawMessage(rawMsg);

  return {
    title: "Notice",
    message: cleanMsg || fallbackMessage,
  };
}

/**
 * Global dispatcher to trigger toast from anywhere (e.g. handleFirestoreError)
 */
export function dispatchGlobalFirebaseError(error: unknown, fallbackMessage?: string) {
  const parsed = parseFirebaseError(error, fallbackMessage);
  if (typeof window !== "undefined") {
    const event = new CustomEvent("studyhelper:firebase-error-toast", {
      detail: parsed,
    });
    window.dispatchEvent(event);
  }
}
