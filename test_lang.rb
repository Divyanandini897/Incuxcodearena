require '/api/config/environment'
Language.all.each { |l| puts "#{l.id}: #{l.name}" }
