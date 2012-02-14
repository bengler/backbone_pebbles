require 'bundler'
Bundler.require

require 'fileutils'
require 'coffee-script'
require 'closure-compiler'

PROJECTNAME = "backbone_pebbles"

root = File.dirname(__FILE__)

def compile_all(filenames)
  result = ""
  filenames.sort.each do |filename|
    basename = File.basename(filename)
    puts "  < #{basename}"
    result << "\n\n/* #{basename} */\n\n"
    result << CoffeeScript.compile(File.read(filename))
  end
  result
end

namespace :test do
  task :compile do
    puts "Building test.js"
    File.open("#{root}/test/test.js", 'w') do |f|
      f.write(compile_all(Dir.glob("#{root}/test/*.coffee")))
    end
  end

  desc "run tests"
  task :run => ['lib:compile', 'test:compile'] do    
    `cd #{root} && npm install && ./node_modules/.bin/mocha -r should ./test/test.js 1>&2`
  end
end

namespace :lib do
  desc "compile library"
  task :compile do
    puts "Building #{PROJECTNAME}.js"
    javascript = compile_all(Dir.glob("#{root}/src/**/*.coffee"))
    File.open("#{root}/#{PROJECTNAME}.js", 'w') do |f|
      f.write(javascript)
    end
    `cd #{root} && npm install`
  end

  desc "compile and minify library"
  task :build => :compile do
    puts "Building minified version"
    File.open("#{root}/#{PROJECTNAME}.min.js", 'w') do |f|
      f.write(Closure::Compiler.new.compile(File.read("#{root}/#{PROJECTNAME}.js")))
    end
  end
end

desc "Remove temporary files"
task :clean do
  `rm -rf #{root}/node_modules && rm #{root}/test/test.js`
end