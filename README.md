# kuizu

Automatic quiz generation for Japanese language teachers

## Installing fastText nearest neighbors

```bash
# get python3 tools if you don't already
suto apt install python3-pip
sudo apt install python3-setuptools
sudo apt install python3-dev

mkdir bin
cd bin

# download japanese model
wget https://dl.fbaipublicfiles.com/fasttext/vectors-crawl/cc.ja.300.bin.gz
gunzip cc.ja.300.bin.gz

# download fastText library
git clone https://github.com/facebookresearch/fastText.git
cd fastText
sudo -H pip3 install .
```
