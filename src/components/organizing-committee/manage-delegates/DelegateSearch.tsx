import React, { useState, useEffect } from "react";
import { Input, AutoComplete, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import VoterService from "@/services/VoterService";
import { BaseResponse } from "@/types/BaseResponse.interface";

interface DelegateSearchProps {
  electionId: string;
  onSearchResult: (results: any[]) => void; // callback trả về kết quả tìm kiếm
}

const DelegateSearch: React.FC<DelegateSearchProps> = ({ electionId, onSearchResult }) => {
  const [keyword, setKeyword] = useState("");
  const [options, setOptions] = useState<{ value: string; label: React.ReactNode }[]>([]);
  const [loading, setLoading] = useState(false);

  // 🟢 Gợi ý realtime khi nhập
  useEffect(() => {
    if (!electionId) {
      setOptions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      if (keyword.trim().length < 1) {
        setOptions([]);
        return;
      }

      try {
        setLoading(true);
        const res: BaseResponse<any> = await VoterService.search({ keyword, electionId });
        console.log("🔍 Search request:", { keyword, electionId });
        console.log("📥 Search response:", res);

        if (res.success && res.data) {
          // API trả về dạng paginated: { content, page, limit, totalItems, totalPages }
          const voters = res.data.content || res.data;
          const votersArray = Array.isArray(voters) ? voters : [];
          console.log("📋 Voters before filter:", votersArray.length);

          // Filter lại theo electionId và keyword
          const keywordLower = keyword.toLowerCase().trim();
          const filteredVoters = votersArray.filter((voter: any) => {
            // Lọc bỏ những người đã xóa
            if (voter.status === "INACTIVE") return false;
            
            // Filter theo electionId nếu có
            if (electionId && voter.electionId) {
              const voterElectionId = String(voter.electionId._id || voter.electionId);
              if (voterElectionId !== electionId) {
                console.log("❌ ElectionId mismatch:", voterElectionId, "!=", electionId);
                return false;
              }
            }
            
            // Filter theo keyword
            const fullName = (voter.userId?.fullName || "").toLowerCase();
            const email = (voter.userId?.email || "").toLowerCase();
            const username = (voter.userId?.username || "").toLowerCase();
            
            const matches = fullName.includes(keywordLower) || 
                   email.includes(keywordLower) || 
                   username.includes(keywordLower);
            
            if (!matches && fullName) {
              console.log("❌ Keyword mismatch:", keywordLower, "not in", fullName, email, username);
            }
            
            // Chỉ hiển thị nếu keyword có trong fullName, email hoặc username
            return matches;
          });
          
          console.log("✅ Filtered voters:", filteredVoters.length);

          setOptions(
            filteredVoters
              .map((voter: any) => ({
                value: voter.userId?.fullName || "",
                label: (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      lineHeight: "1.3",
                      padding: "4px 0",
                    }}
                  >
                    <strong style={{ color: "#333" }}>{voter.userId?.fullName || "N/A"}</strong>
                    <small style={{ color: "#999", fontSize: 12 }}>
                      {voter.userId?.email || ""} {voter.userId?.username ? `(${voter.userId.username})` : ""}
                    </small>
                  </div>
                ),
                voter: voter, // Lưu toàn bộ thông tin voter để dùng khi select
              }))
          );
        } else {
          setOptions([]);
        }
      } catch (err) {
        console.error("Lỗi khi tìm kiếm:", err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300); // Giảm delay để phản hồi nhanh hơn

    return () => clearTimeout(delayDebounce);
  }, [keyword, electionId]);

  // 🟠 Khi nhấn Enter hoặc click icon search
  const handleSearch = async () => {
    if (!keyword.trim()) {
      onSearchResult([]); // Nếu rỗng, reset về danh sách đầy đủ
      return;
    }
    if (!electionId) {
      message.warning("Vui lòng chọn cuộc bầu cử trước");
      return;
    }
    try {
      setLoading(true);
      const res: BaseResponse<any> = await VoterService.search({ keyword, electionId });
      console.log("🔍 Search button request:", { keyword, electionId });
      console.log("📥 Search button response:", res);
      
      if (res.success && res.data) {
        // API trả về dạng paginated: { content, page, limit, totalItems, totalPages }
        const voters = res.data.content || res.data;
        const votersArray = Array.isArray(voters) ? voters : [];
        console.log("📋 Voters before filter (button):", votersArray.length);
        
        // Filter lại theo electionId và keyword
        const keywordLower = keyword.toLowerCase().trim();
        const activeVoters = votersArray.filter((v: any) => {
          // Lọc bỏ những người đã xóa
          if (v.status === "INACTIVE") return false;
          
          // Filter theo electionId nếu có
          if (electionId && v.electionId) {
            const voterElectionId = String(v.electionId._id || v.electionId);
            if (voterElectionId !== electionId) {
              console.log("❌ ElectionId mismatch (button):", voterElectionId, "!=", electionId);
              return false;
            }
          }
          
          // Filter theo keyword
          const fullName = (v.userId?.fullName || "").toLowerCase();
          const email = (v.userId?.email || "").toLowerCase();
          const username = (v.userId?.username || "").toLowerCase();
          
          const matches = fullName.includes(keywordLower) || 
                 email.includes(keywordLower) || 
                 username.includes(keywordLower);
          
          if (!matches && fullName) {
            console.log("❌ Keyword mismatch (button):", keywordLower, "not in", fullName, email, username);
          }
          
          // Chỉ hiển thị nếu keyword có trong fullName, email hoặc username
          return matches;
        });
        
        console.log("✅ Filtered voters (button):", activeVoters.length);
        
        onSearchResult(activeVoters);
        if (activeVoters.length === 0) {
          message.info("Không tìm thấy đại biểu nào");
        }
      } else {
        message.error(res.message || "Không tìm thấy đại biểu");
        onSearchResult([]);
      }
    } catch (err: any) {
      console.error("Lỗi khi tìm kiếm:", err);
      message.error(err?.response?.data?.message || "Đã xảy ra lỗi khi tìm kiếm đại biểu");
      onSearchResult([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <AutoComplete
        options={options}
        value={keyword}
        onChange={setKeyword}
        onSelect={(value, option: any) => {
          setKeyword(value);
          // Khi chọn từ autocomplete, tự động search
          if (option?.voter) {
            onSearchResult([option.voter]);
          }
        }}
        style={{ width: "100%" }}
        filterOption={false} // Tắt filter client-side vì đã filter ở server
      >
        <Input.Search
          placeholder="🔎 Tìm kiếm đại biểu..."
          allowClear
          size="large"
          enterButton={<SearchOutlined/>}
          loading={loading}
          onChange={(e) => {
            setKeyword(e.target.value);
            // Khi xóa hết text, reset về danh sách đầy đủ
            if (!e.target.value.trim()) {
              onSearchResult([]);
            }
          }}
          onSearch={handleSearch}
          style={{ marginBottom: 16 ,borderRadius: 8 }}
        />
      </AutoComplete>
    </div>
  );
};

export default DelegateSearch;
