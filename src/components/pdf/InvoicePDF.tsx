import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import type { Order } from '../../types';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  logo: {
    width: 120,
    height: 'auto',
    marginBottom: 10
  },
  leftColumn: {
    width: '60%'
  },
  rightColumn: {
    width: '35%'
  },
  companyInfo: {
    marginBottom: 4,
    fontSize: 10,
    color: '#333333'
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right'
  },
  orderInfo: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'right'
  },
  billTo: {
    marginTop: 20,
    marginBottom: 30
  },
  billToTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8
  },
  billToText: {
    fontSize: 10,
    marginBottom: 4,
    color: '#444444'
  },
  table: {
    marginTop: 20,
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 8,
    backgroundColor: '#f8f9fa'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingVertical: 8
  },
  description: { width: '40%' },
  quantity: { width: '20%', textAlign: 'right' },
  price: { width: '20%', textAlign: 'right' },
  amount: { width: '20%', textAlign: 'right' },
  totalsContainer: {
    marginTop: 20,
    marginLeft: 'auto',
    width: '40%'
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 4
  },
  totalLabel: {
    width: '60%',
    textAlign: 'right',
    paddingRight: 8
  },
  totalValue: {
    width: '40%',
    textAlign: 'right'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666666'
  }
});

interface InvoicePDFProps {
  order: Order & {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    customerCompany?: string;
  };
  customer?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
  };
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ order, customer }) => {
  // Safely format date
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleDateString();
    } catch (e) {
      return 'N/A';
    }
  };

  // Safely format currency
  const formatCurrency = (amount: number | undefined) => {
    return `$${(amount || 0).toFixed(2)}`;
  };

  // Get customer display name
  const customerName = customer 
    ? `${customer.firstName} ${customer.lastName}`.trim()
    : 'N/A';

  // Format order number
  const getFormattedOrderNumber = () => {
    if (!order) return 'N/A';
    
    // If order has an order number, use it
    if (order.orderNumber && order.orderNumber.trim() !== '') {
      return `INV${order.orderNumber}`;
    }
    
    // If order has a creation date, generate a number
    if (order.createdAt) {
      const createdAt = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
      return `INV${format(createdAt, 'yyMMdd')}001`;
    }
    
    // Final fallback
    return 'INV000000000';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.leftColumn}>
            <Image 
              src="https://res.cloudinary.com/fresh-ideas/image/upload/v1732284592/rqo2kuav7gd3ntuciejw.png"
              style={styles.logo}
            />
            <Text style={styles.companyInfo}>5 Bemore Gardens</Text>
            <Text style={styles.companyInfo}>Sandton 2196</Text>
            <Text style={styles.companyInfo}>Phone: +27 66 104 6694</Text>
            <Text style={styles.companyInfo}>Email: info@mgaccountants.co.za</Text>
          </View>
          
          <View style={styles.rightColumn}>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.orderInfo}>Order Number: {getFormattedOrderNumber()}</Text>
            <Text style={styles.orderInfo}>
              Date: {formatDate(order.orderDate || order.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.billTo}>
          <Text style={styles.billToTitle}>Bill To:</Text>
          <Text style={styles.billToText}>{customerName}</Text>
          {customer?.company && (
            <Text style={styles.billToText}>{customer.company}</Text>
          )}
          <Text style={styles.billToText}>{customer?.address || 'N/A'}</Text>
          <Text style={styles.billToText}>Email: {customer?.email || 'N/A'}</Text>
          <Text style={styles.billToText}>Phone: {customer?.phone || 'N/A'}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.description}>DESCRIPTION</Text>
            <Text style={styles.quantity}>QUANTITY</Text>
            <Text style={styles.price}>UNIT PRICE</Text>
            <Text style={styles.amount}>AMOUNT</Text>
          </View>

          {(order.products || []).map((product, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.description}>{product?.name || 'N/A'}</Text>
              <Text style={styles.quantity}>{product?.quantity || 0}</Text>
              <Text style={styles.price}>{formatCurrency(product?.unitPrice)}</Text>
              <Text style={styles.amount}>
                {formatCurrency((product?.quantity || 0) * (product?.unitPrice || 0))}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency((order.totalAmount || 0) - (order.vatAmount || 0))}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VAT (15%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.vatAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.totalAmount)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
          <Text>This is a computer-generated document. No signature is required.</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;