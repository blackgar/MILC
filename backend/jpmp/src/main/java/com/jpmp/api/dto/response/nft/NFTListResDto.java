package com.jpmp.api.dto.response.nft;


import com.jpmp.api.dto.request.nft.NFTDto;
import com.jpmp.api.dto.response.BaseResponseBody;
import com.jpmp.api.dto.response.rBoard.RBoardDto;
import com.jpmp.api.dto.response.rBoard.RBoardListResDto;
import com.jpmp.db.entity.board.RealizationBoard;
import com.jpmp.db.entity.nft.NFT;
import io.swagger.annotations.ApiModel;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class NFTListResDto extends BaseResponseBody {

    private List<NFTDto> nftDtoList;

    public static NFTListResDto of(Integer statusCode, String message, List<NFT> nftList) {
        NFTListResDto res = new NFTListResDto();
        res.setStatusCode(statusCode);
        res.setMessage(message);


        res.setNftDtos(nftList);
        return res;
    }

    public void setNftDtos(List<NFT> nftList) {
        nftDtoList = new ArrayList<>();
        for (int i =0 ; i < nftList.size() ; i ++){
            nftDtoList.add(NFTDto.of(nftList.get(i)));
        }
    }
}
