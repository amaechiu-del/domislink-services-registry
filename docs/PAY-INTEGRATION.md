# Central Pay integration

Use existing amaechiu-del/domislink-pay and its reviewed SDK. Registry records dependency metadata and approval state only. It must never hold Paystack keys, process checkout, or grant entitlements.

Before approval verify application identity, merchant isolation, server-authoritative amount and currency, signed webhooks, idempotent fulfillment, reconciliation, and disabled live payment flag in staging. Record reviewed SDK commit and acceptance evidence. No approval automatically enables payments.

Respect existing application subscription contracts and continued historical record access. No forced lockout or paid activation through registry metadata.
