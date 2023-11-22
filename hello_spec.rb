require_relative 'hello'

describe 'HelloWorld' do
  it 'says hello' do
    result = HelloWorld.say_hello

    expect(result).to eq('Hello, World!')
  end
end
