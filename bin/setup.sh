#!/bin/bash

# Install Ruby
echo "Installing Ruby..."
sudo apt-get update
sudo apt-get install -y ruby-full

# Install RubyGems
echo "Installing RubyGems..."
sudo apt-get install -y rubygems

# Update RubyGems
echo "Updating RubyGems..."
gem update --system

# Install Bundler
echo "Installing Bundler..."
gem install bundler

echo "Installing RSpec..."
gem install rspec

