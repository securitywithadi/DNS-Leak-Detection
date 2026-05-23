Limitations to keep in mind

This script traces standard, plain-text DNS on port 53. If your browser (like Chrome or Firefox) is configured to use "Secure DNS" (DNS over HTTPS), those requests are encrypted and sent over port 443. In that scenario, port 53 sniffing won't capture them, which is actually a good thing for privacy, though it makes local tracing more complex.