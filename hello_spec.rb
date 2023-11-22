# hello_spec.rb

# This is a simple RSpec example
# It tests a "Hello World" function

# Require the code you want to test
require_relative 'hello'

# Describe the functionality you're testing
describe 'HelloWorld' do
  # Define a specific behavior within the described functionality
  it 'says hello' do
    # Create an instance or call the method you want to test
    result = HelloWorld.say_hello

    # Define the expected outcome
    expect(result).to eq('Hello, World!')
  end
end
