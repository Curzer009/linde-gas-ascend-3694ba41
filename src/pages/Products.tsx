import ProductsSection from "@/components/ProductsSection";
import ReturnsTable from "@/components/ReturnsTable";
import DashboardNav from "@/components/DashboardNav";

const Products = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <DashboardNav />
      <div className="pt-20">
        <ProductsSection />
        <ReturnsTable />
      </div>
    </div>
  );
};

export default Products;
