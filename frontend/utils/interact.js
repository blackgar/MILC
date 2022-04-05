import NFT from "../src/abis/NFT.json";
import Marketplace from "../src/abis/Marketplace.json";
import { ethers } from "ethers";
import Web3 from "web3";
import useUser from "@libs/client/useUser";

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = Web3.utils.toChecksumAddress(accounts[0].toLowerCase());
      const wallet = {
        status: "",
        address: account,
        accounts: accounts,
      };
      return wallet;
    } catch (err) {
      return {
        address: "",
        status: err.message,
      };
    }
  } else {
    alert("메타마스크를 깔아주세요~;");
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://metamask.io/download.html"
            >
              메타마스크를 설치한 후 지갑을 연결해주세요.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const marketContract = async (signer) => {
  const contract = new ethers.Contract(
    Marketplace.networks["5777"].address,
    Marketplace.abi,
    signer
  );
  return contract;
};

export const nftContract = async (signer) => {
  const contract = new ethers.Contract(
    NFT.networks["5777"].address,
    NFT.abi,
    signer
  );
  return contract;
};

export const loadMarketItems = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const marketplace = await marketContract(signer);
  const nft = await nftContract(signer);
  const itemCounts = await marketplace.itemCount();
  // const item2 = await marketplace.items(0);
  // console.log(item2);
  // console.log(itemCounts);
  let items = [];
  let sellers = [];
  for (let i = 1; i <= itemCounts; i++) {
    const item = await marketplace.items(i);

    if (!item.sold) {
      // get uri url from nft contract
      const uri = await nft.tokenURI(item.tokenId);
      // use uri to fetch the nft metadata stored on ipfs
      const response = await fetch(uri);
      const metadata = await response.json();
      // get total price of item (item price + fee)
      const totalPrice = await marketplace.getTotalPrice(item.itemId);
      // Add item to items array
      items.push({
        totalPrice,
        itemId: item.itemId,
        seller: item.seller,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
      });
      // console.log("이 NFT의 ID 값은", item.itemId);
      // console.log("이 NFT의 주인은", item.seller);
      // console.log("이 상품의 이미지 주소는", item.image);
      // console.log(item);
      sellers.push(item.seller);
    }
  }
  // console.log(items);
  // console.log(sellers);
  // console.log(
  //   items[itemCounts - 1].seller,
  //   items[itemCounts - 1].itemId,
  //   typeof items[itemCounts - 1].itemId
  // );
  return {
    items: items,
    seller: sellers,
  };
};

export const loadNFTItems = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const marketplace = await marketContract(signer);
  const nft = await nftContract(signer);
  const itemCounts = await nft.tokenCount(); // 7
  // console.log(itemCounts);
  const response = await connectWallet();
  const address = response?.address;
  // console.log(response.address);

  let items = [];
  for (let i = 1; i <= itemCounts; i++) {
    const uri = await nft.tokenURI(i);
    const res = await fetch(uri);
    const metadata = await res.json();
    const data = await nft.ownerOf(i);
    // console.log(metadata);
    // console.error("★★★★★★★★★★★★★★");
    // console.log(address);
    // console.log(data);
    // console.error("★★★★★★★★★★★★★★");
    // console.log(metadata);
    // console.log(nft.ownerOf(i));
    items.push({
      nftId: i.toString(),
      address: data,
      image: metadata.image,
      name: metadata.name,
      description: metadata.description,
      edition: metadata.edition,
      product: metadata.product,
      nickname: metadata.nickname,
    });
    // console.log(item);
  }

  // console.log(nft.address);
  // console.log(items);
  // return items;
  return items;
};

export const isRealizedItem = async (nftId) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const res = await nftContract(signer);
  const tokenId = Number(nftId);
  const re = await res.isRealization(tokenId);
  return re;
};

export const isMarketItem = async (nftId) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const nft = await nftContract(signer);
  const marketplace = await marketContract(signer);
  const itemAccount = await nft.ownerOf(Number(nftId));
  console.log(itemAccount);
  console.log(marketplace.address);

  if (itemAccount === marketplace.address) {
    const item = await marketplace.items(Number(nftId));
    return item.seller;
  }
};

export const findNFT = async (nftId) => {
  const items = await loadNFTItems();
  for (let i = 0; i < items.length; i++) {
    if (items[i].nftId === nftId) {
      const item = {
        nftId: items[i].nftId,
        address: items[i].address.toString(),
        image: items[i].image.toString(),
        name: items[i].name.toString(),
        description: items[i].description.toString(),
        edition: items[i].edition,
        product: items[i].product,
        nickname: items[i].nickname,
      };
      // console.log(item);
      return item;
    }
  }
};

export const findMarketNFT = async (nftId) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const marketplace = await marketContract(signer);
  const item = await marketplace.items(Number(nftId));
  return item;
};

export const purchaseMarketItem = async (nftId) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const nft = await nftContract(signer);
  const marketplace = await marketContract(signer);
  const item = await marketplace.items(Number(nftId));
  const totalPrice = await marketplace.getTotalPrice(Number(nftId));
  console.log(totalPrice);
  console.log(item.seller);
  await (
    await marketplace.purchaseItem(item.itemId, { value: totalPrice })
  ).wait();
  window.location.reload();
};

export const sellMarketItem = async (nftId, price) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const nft = await nftContract(signer);
  const marketplace = await marketContract(signer);
  const listingPrice = ethers.utils.parseEther(price.toString());
  const res = await (
    await marketplace.makeItem(nft.address, Number(nftId), listingPrice)
  ).wait();
  window.location.reload();
  console.log(res);
};

export const getUserBalance = async () => {
  if (typeof window.ethereum !== "undefined") {
    const web3 = new Web3(window.ethereum);
    const wallet = await connectWallet();
    const balance = await web3.eth.getBalance(wallet.address);
    const balanceEth = ethers.utils.formatEther(balance);
    return balanceEth;
  }
};
