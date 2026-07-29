#!/bin/bash
# Check what rlimits isolate sets without --cg
box_id=999990
isolate -b $box_id --init 2>/dev/null
echo 'import resource; print(resource.getrlimit(resource.RLIMIT_NPROC))' > /var/local/lib/isolate/$box_id/box/script.py
sudo chown judge0: /var/local/lib/isolate/$box_id/box/script.py

echo "=== RLIMIT_NPROC inside sandbox ==="
isolate -b $box_id -s -t 5 -w 10 -k 64000 -m 128000 -f 1024 \
  -E PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" \
  --run -- /usr/local/python-3.8.1/bin/python3 -c 'import resource; print("NPROC:", resource.getrlimit(resource.RLIMIT_NPROC)); print("AS:", resource.getrlimit(resource.RLIMIT_AS)); print("CPU:", resource.getrlimit(resource.RLIMIT_CPU))'

echo ""
echo "=== All rlimits outside sandbox ==="
python3 -c 'import resource; [print(f"{name}: {resource.getrlimit(getattr(resource, name))}") for name in dir(resource) if name.startswith("RLIMIT_")]'

isolate -b $box_id --cleanup 2>/dev/null
