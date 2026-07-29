require '/api/config/environment'
submission = Submission.last
puts "Submission ID: #{submission.id}"
puts "box_id: #{submission.id % 2147483647}"
puts "cgroups: ['']"
box_id = submission.id % 2147483647
result = `isolate -b #{box_id} --init 2>&1`
puts "isolate result: [#{result}]"
puts "isolate result chomp: [#{result.chomp}]"
puts "isolate result empty: #{result.empty?}"
