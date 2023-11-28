#!/bin/bash

input=$(cat)
echo "$input" | tr '[:lower:]' '[:upper:]'
