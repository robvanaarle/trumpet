#!/bin/sh

# Go to Trumpet dir, this makes things a lot easier. Otherwise the package
# and spk contain the folder 'Trumpet'.
cd ./Trumpet

# Create a package.tgz from the source files
# -prevent including of ./trumpet/public/synoman in ./package.tgz (These files are on the NAS)
tar -cvzf ./package.tgz --exclude='./trumpet/public/synoman' --exclude='./trumpet/temp/session/?*' --exclude='.DS_Store' --exclude='.git' ./trumpet

# Create the spk
# -prevent including of ./trumpet in Trumpet (./package.tgz contains these files)
tar -cvf ../Trumpet.spk --exclude='trumpet' *

# Clean up
rm ./package.tgz