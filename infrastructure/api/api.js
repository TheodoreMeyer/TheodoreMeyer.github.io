import { API_CONFIG } from "./config.js";
import { testApi } from "./test.js";

const USE_TEST_API = false;

export async function api(action, params = {}) {
    if (USE_TEST_API) {
        return testApiCall(
            action,
            params
        );
    }

    return realApiCall(
        action,
        params
    );
}

async function testApiCall(
    action,
    params
) {
    return testApi(
        action,
        params
    );
}

async function realApiCall(
    action,
    params
) {
    return jsonp(
        action,
        params
    );
}

function jsonp(action, params = {}) {
    return new Promise(
        (resolve, reject) => {
            const callbackName =
                `apiCallback_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}`;

            const script =
                document.createElement(
                    "script"
                );

            let timeout;

            function cleanup() {
                delete window[
                    callbackName
                ];

                script.remove();

                if (timeout) {
                    clearTimeout(timeout);
                }
            }

            window[callbackName] = data => {
                cleanup();
                resolve(data);
            };

            script.onerror = () => {
                cleanup();

                reject(
                    new Error(
                        "API request failed."
                    )
                );
            };

            const query =
                new URLSearchParams({
                    action,
                    client:
                        API_CONFIG.clientId,
                    ...params,
                    callback:
                        callbackName
                });

            script.src =
                `${API_CONFIG.url}?${query}`;

            document.head.appendChild(
                script
            );

            timeout = setTimeout(() => {
                cleanup();

                reject(
                    new Error(
                        "API request timed out."
                    )
                );
            }, 10000);
        }
    );
}