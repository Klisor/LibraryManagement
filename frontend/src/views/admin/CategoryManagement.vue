<template>
  <div class="category-management">
    <el-container style="height: 100vh;">
      <!-- 侧边栏 -->
      <AdminAside />

      <!-- 主内容区 -->
      <el-container>
        <!-- 顶部导航栏 -->
        <el-header class="admin-header">
          <div class="user-actions">
            <el-dropdown @command="handleCommand" class="admin-user-info">
              <span class="el-dropdown-link">
                <i class="el-icon-user"></i>
                {{ user.username }}
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 内容区 -->
        <el-main class="ancient-main">
          <div class="page-header">
            <h2>分类管理</h2>
          </div>

          <!-- 柱状图容器 -->
          <div class="chart-container">
            <canvas 
              ref="barChartCanvas"
              width="1270" 
              height="400"
              class="bar-chart-canvas"
            ></canvas>
          </div>

          <!-- 分类表格 -->
          <div class="table-container">
            <el-table
              :data="categories"
              border
              stripe
              style="width: 100%; margin-top: 20px;"
              v-loading="loading"
              class="ancient-table"
            >
              <el-table-column
                prop="id"
                label="ID"
                width="60"
                sortable
                :sort-orders="['ascending', 'descending']"
              ></el-table-column>
              <el-table-column
                prop="name"
                label="分类名称"
                min-width="150"
                sortable
                :sort-orders="['ascending', 'descending']"
              ></el-table-column>
              <el-table-column
                prop="bookCount"
                label="图书数量"
                width="120"
                sortable
                :sort-orders="['ascending', 'descending']"
              ></el-table-column>
              <el-table-column
                prop="borrowedCount"
                label="已借阅数量"
                width="120"
                sortable
                :sort-orders="['ascending', 'descending']"
              ></el-table-column>
              <el-table-column
                label="颜色"
                width="80"
              >
                <template slot-scope="scope">
                  <div class="color-square" :style="{ backgroundColor: getCategoryColor(scope.row.id) }"></div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { dashboardApi } from '@/api/dashboard';

export default {
  name: 'CategoryManagement',
  
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      loading: false,
      categories: []
    };
  },
  
  mounted() {
    this.fetchCategories();
  },
  
  methods: {
    // 获取分类颜色
    getCategoryColor(categoryCode) {
      const colors = [
        '#ff6b6b', '#48dbfb', '#1dd1a1', '#feca57', '#ff9ff3',
        '#f368e0', '#ff9f43', '#54a0ff', '#5f27cd', '#c8d6e5',
        '#00d2d3', '#ff9ff3', '#f368e0', '#ff9f43', '#54a0ff'
      ];
      return colors[(categoryCode - 1) % colors.length];
    },
    
    handleCommand(command) {
      if (command === 'logout') {
        this.logout();
      }
    },
    
    logout() {
      localStorage.removeItem('user');
      this.$router.push('/admin/login');
    },
    
    fetchCategories() {
      this.loading = true;
      dashboardApi.getCategories().then(response => {
        const res = response.data;
        console.log('分类数据:', res);
        
        if (res.code === 200) {
          this.categories = res.data;
          
          // 等待DOM更新后渲染柱状图
          this.$nextTick(() => {
            setTimeout(() => {
              this.renderBarChart();
            }, 100);
          });
        } else {
          this.$message.error(res.message);
        }
      }).catch(error => {
        console.error('获取分类数据失败:', error);
        this.$message.error('获取分类数据失败');
      }).finally(() => {
        this.loading = false;
      });
    },
    
    // 渲染柱状图
    renderBarChart() {
      const canvas = this.$refs.barChartCanvas;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 设置画布背景
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 如果没有数据
      if (!this.categories || this.categories.length === 0) {
        this.drawNoDataText(ctx, canvas);
        return;
      }
      
      // 柱状图配置
      const config = {
        margin: { top: 40, right: 30, bottom: 70, left: 60 },
        barWidth: 50,
        barGap: 20,
        maxBarHeight: 300,
        colors: this.categories.map((_, index) => this.getCategoryColor(index + 1))
      };
      
      // 绘制图表
      this.drawChart(ctx, canvas, config);
    },
    
    // 绘制图表
    drawChart(ctx, canvas, config) {
      const { margin, barWidth, barGap, maxBarHeight, colors } = config;
      const data = this.categories;
      
      // 计算最大图书数量
      const maxBookCount = Math.max(...data.map(item => item.bookCount || 0));
      const maxBorrowedCount = Math.max(...data.map(item => item.borrowedCount || 0));
      const maxValue = Math.max(maxBookCount, maxBorrowedCount);
      
      // 计算比例尺
      const scaleY = maxBarHeight / maxValue;
      
      // 计算可用宽度和起始X坐标
      const availableWidth = canvas.width - margin.left - margin.right;
      const totalWidth = data.length * (barWidth + barGap) - barGap;
      const startX = margin.left + (availableWidth - totalWidth) / 2;
      
      // 绘制标题
      this.drawTitle(ctx, canvas, '分类图书数量统计');
      
      // 绘制坐标轴
      this.drawAxes(ctx, canvas, margin, maxValue, scaleY);
      
      // 绘制柱状图
      data.forEach((item, index) => {
        const x = startX + index * (barWidth + barGap);
        
        // 绘制图书数量柱
        this.drawBar(
          ctx, 
          x, 
          canvas.height - margin.bottom, 
          barWidth, 
          (item.bookCount || 0) * scaleY, 
          colors[index], 
          item.name, 
          '图书数量',
          item.bookCount || 0
        );
        
        // 绘制借阅数量柱（并排显示）
        // const borrowedX = x + barWidth / 2;
        // this.drawBar(
        //   ctx, 
        //   borrowedX, 
        //   canvas.height - margin.bottom, 
        //   barWidth / 2, 
        //   (item.borrowedCount || 0) * scaleY, 
        //   this.darkenColor(colors[index], 0.3), 
        //   item.name, 
        //   '借阅数量',
        //   item.borrowedCount || 0,
        //   true
        // );
      });
      
      // 绘制图例
      this.drawLegend(ctx, canvas, margin);
    },
    
    // 绘制柱状图标题
    drawTitle(ctx, canvas, title) {
      ctx.save();
      ctx.font = 'bold 20px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#5b4636';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(title, canvas.width / 2, 25);
      ctx.restore();
    },
    
    // 绘制坐标轴
    drawAxes(ctx, canvas, margin, maxValue, scaleY) {
      ctx.save();
      ctx.strokeStyle = '#5b4636';
      ctx.lineWidth = 1;
      
      // 绘制X轴
      ctx.beginPath();
      ctx.moveTo(margin.left, canvas.height - margin.bottom);
      ctx.lineTo(canvas.width - margin.right, canvas.height - margin.bottom);
      ctx.stroke();
      
      // 绘制Y轴
      ctx.beginPath();
      ctx.moveTo(margin.left, canvas.height - margin.bottom);
      ctx.lineTo(margin.left, margin.top);
      ctx.stroke();
      
      // 绘制Y轴刻度
      const tickCount = 5;
      ctx.font = '12px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      
      for (let i = 0; i <= tickCount; i++) {
        const value = (maxValue / tickCount) * i;
        const y = canvas.height - margin.bottom - (value * scaleY);
        
        // 刻度线
        ctx.beginPath();
        ctx.moveTo(margin.left - 5, y);
        ctx.lineTo(margin.left, y);
        ctx.stroke();
        
        // 刻度值
        ctx.fillText(Math.round(value).toString(), margin.left - 8, y);
        
        // 网格线
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(canvas.width - margin.right, y);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.stroke();
        ctx.strokeStyle = '#5b4636';
      }
      
      // Y轴标签
      ctx.save();
      ctx.font = '14px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#5b4636';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.translate(25, canvas.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('数量（本）', 0, 0);
      ctx.restore();
      
      ctx.restore();
    },
    
    // 绘制单个柱子
    drawBar(ctx, x, y, width, height, color, label, type, value, isBorrowed = false) {
      ctx.save();
      
      // 绘制柱子
      ctx.fillStyle = color;
      ctx.fillRect(x, y - height, width, height);
      
      // 添加阴影效果
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetY = 2;
      
      // 绘制柱子上方的值
      ctx.font = 'bold 12px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      
      if (height > 15) {
        ctx.fillText(value.toString(), x + width / 2, y - height - 5);
      } else {
        ctx.fillText(value.toString(), x + width / 2, y - height + 15);
      }
      
      // 绘制X轴标签
      ctx.fillStyle = '#5b4636';
      ctx.font = '12px "Microsoft YaHei", sans-serif';
      ctx.textBaseline = 'top';
      
      // 显示分类名称
      ctx.save();
      if (label.length > 6) {
        // 长名称分两行显示
        const firstLine = label.substring(0, 6);
        const secondLine = label.substring(6);
        ctx.fillText(firstLine, x + width / 2, y + 5);
        ctx.fillText(secondLine, x + width / 2, y + 22);
      } else {
        ctx.fillText(label, x + width / 2, y + 5);
      }
      ctx.restore();
      
      ctx.restore();
    },
    
    // 绘制图例
    drawLegend(ctx, canvas, margin) {
      ctx.save();
      
      const legendItems = [
        { label: '图书数量', color: 'white' },
        // { label: '借阅数量', color: this.darkenColor('#48dbfb', 0.3) }
      ];
      
      const legendX = canvas.width - margin.right - 150;
      const legendY = margin.top;
      
      ctx.font = '12px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      
      legendItems.forEach((item, index) => {
        const y = legendY + index * 25;
        
        // 绘制颜色方块
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, y - 8, 16, 16);
        
        // 绘制标签
        ctx.fillStyle = '#5b4636';
        ctx.fillText(item.label, legendX + 22, y);
      });
      
      ctx.restore();
    },
    
    // 变暗颜色
    darkenColor(color, amount) {
      // 简单的颜色变暗处理
      if (color.startsWith('#')) {
        const num = parseInt(color.slice(1), 16);
        const r = Math.max(0, ((num >> 16) & 0xFF) * (1 - amount));
        const g = Math.max(0, ((num >> 8) & 0xFF) * (1 - amount));
        const b = Math.max(0, (num & 0xFF) * (1 - amount));
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
      }
      return color;
    },
    
    // 绘制无数据提示
    drawNoDataText(ctx, canvas) {
      ctx.font = '18px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = 'rgba(102, 102, 102, 0.7)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('暂无分类数据', canvas.width / 2, canvas.height / 2);
    }
  }
};
</script>

<style scoped>
/* 导入全局样式 */
@import '@/assets/ancient-form.css';

/* 通用古籍字体 - 只用于标题 */
h1, h2, h3, h4, h5, h6 {
  font-family: "STKaiti", "KaiTi", serif;
}

/* 容器 */
.category-management {
  min-height: 100vh;
  background-image: url('@/assets/image/home2.jpg');
  background-size: 110% 110%;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.category-management::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  z-index: -1;
}

/* 顶部导航栏 */
.admin-header {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 60px !important;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}

/* 用户信息样式 */
.admin-user-info .el-dropdown-link {
  cursor: pointer;
  color: #8b7355;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(250, 248, 245, 0.9);
  border: 1px solid #e8d4b8;
  transition: all 0.3s;
  font-family: "STKaiti", "KaiTi", serif;
  font-size: 14px;
}

.admin-user-info .el-dropdown-link:hover {
  background: rgba(247, 243, 236, 0.95);
  border-color: #cbc0b1;
  color: #5b4636;
  box-shadow: 0 2px 8px rgba(155, 135, 110, 0.15);
}

.admin-user-info .el-dropdown-link i {
  margin-right: 6px;
  color: #a7874b;
}

.admin-user-info .el-dropdown-link .el-icon-arrow-down {
  margin-left: 6px;
  font-size: 12px;
  color: #8b7355;
}

.el-dropdown-menu {
  background: #ffffff !important;
  border: 1px solid #f6f1ea !important;
  border-radius: 8px !important;
}

.el-dropdown-menu__item:hover,
.el-dropdown-menu__item.is-hovered {
  background-color: rgba(230, 217, 203, 0.3) !important;
  color: #5b4636 !important;
}

/* 主内容区 */
.ancient-main {
  background: transparent;
  padding: 20px;
  min-height: calc(100vh - 60px);
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  border: 1px solid #e8d4b8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.page-header h2 {
  color: #5b4636;
  font-size: 22px;
  margin: 0;
}

/* 柱状图容器 */
.chart-container {
  background: rgba(255, 255, 255, 0.3);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #e8d4b8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bar-chart-canvas {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); */
  transition: transform 0.3s ease;
}

.bar-chart-canvas:hover {
  transform: scale(1.005);
}

/* 分类表格 */
.table-container {
  background: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #e8d4b8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.color-square {
  width: 20px;
  height: 20px;
  display: inline-block;
  border-radius: 4px;
}

/* 表格样式 */
.ancient-table {
  background: transparent;
  border: none;
}

.ancient-table::before {
  display: none;
}

.ancient-table th {
  background: rgba(245, 240, 230, 0.8) !important;
  color: #5b4636 !important;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
  border-bottom: 1px solid #e8d4b8 !important;
  font-size: 14px;
  padding: 12px 0 !important;
}

.ancient-table td {
  color: #333 !important;
  border-bottom: 1px solid #f0e9dd !important;
  padding: 12px 0 !important;
  font-size: 13px;
}

.ancient-table .el-table__row:hover td {
  background: rgba(232, 212, 184, 0.1) !important;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .el-aside {
    width: 60px !important;
  }
  
  .logo h3 {
    display: none;
  }
  
  .logo-img {
    margin-right: 0;
  }
  
  .el-menu-item span {
    display: none;
  }
  
  .el-menu-item i {
    margin-right: 0;
  }
  
  .page-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .chart-container {
    padding: 10px;
  }
  
  .bar-chart-canvas {
    max-width: 100%;
    height: auto;
  }
  
  .ancient-table th,
  .ancient-table td {
    padding: 8px 0 !important;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .admin-header {
    padding: 0 10px;
  }
  
  .admin-user-info .el-dropdown-link {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .chart-container {
    padding: 5px;
  }
}
</style>