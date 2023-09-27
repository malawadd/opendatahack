import { RcFile } from "antd/lib/upload";
import { NFTStorage } from "nft.storage";
import { NftStorageToken } from "../../../utils/constants";
import { LaunchFormData } from "./constants";

const client = new NFTStorage({
  token: NftStorageToken!,
});

function getImageBlob(data: LaunchFormData): File | Blob {
  const toFile = (file: RcFile) => {
    const [, extension] = file.type.split("/");

    return new File([data?.logoImage], `image.${extension}`, {
      type: data.logoImage.type,
    });
  };

  return toFile(data?.logoImage);
}

export async function uploadFileIpfs(payload: LaunchFormData) {
  const cid = await client.storeBlob(getImageBlob(payload));

  return `https://cloudflare-ipfs.com/ipfs/${cid}`;
}
