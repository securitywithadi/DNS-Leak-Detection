from scapy.all import sniff, DNSQR, IP

def process_dns_packet(packet):
    """
    Callback function to parse and print DNS query details.
    """
    # Verify the packet contains a DNS Query Record and an IP layer
    if packet.haslayer(DNSQR) and packet.haslayer(IP):
        try:
            # Decode the queried domain name
            query_domain = packet[DNSQR].qname.decode('utf-8').rstrip('.')
            src_ip = packet[IP].src
            dst_ip = packet[IP].dst
            
            print(f"[*] Queried Domain : {query_domain}")
            print(f"    Source IP      : {src_ip}")
            print(f"    Destination DNS: {dst_ip}")
            print("-" * 55)
        except Exception as e:
            pass # Ignore malformed packets

        if __name__ == "__main__":
    print("Starting DNS Tracer... (Press Ctrl+C to stop)")
    print("Monitoring UDP Port 53 for plain-text DNS queries.")
    print("=" * 55)
    
    try:
        # Sniff network traffic specifically for DNS (UDP port 53)
        # store=0 prevents memory leaks by discarding packets after processing
        sniff(filter="udp port 53", prn=process_dns_packet, store=0)
    except PermissionError:
        print("[!] Error: Packet sniffing requires elevated privileges.")
        print("    Linux/macOS: Run with 'sudo python3 dns_leak_tracer.py'")
        print("    Windows: Run your command prompt or IDE as Administrator.")