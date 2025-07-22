# Certificate Regeneration Guide

This guide explains how to regenerate existing certificates with updated HOD (Head of Department) information and signatures.

## 🎯 When to Use Certificate Regeneration

You should regenerate certificates when:

- ✅ HOD information has been updated in the system
- ✅ HOD has uploaded or changed their signature
- ✅ Old certificates show hardcoded or incorrect HOD names
- ✅ You want to ensure all certificates have the latest HOD signature

## 🔧 Prerequisites

Before regenerating certificates, ensure:

1. **HOD User Exists**: An active HOD user must exist in the system
2. **HOD Signature Uploaded**: The HOD should upload and activate their signature
3. **Proper Permissions**: You need admin, coordinator, or HOD role access

### Setting Up HOD Signature

1. Login as HOD user
2. Go to **HOD Dashboard** → **Signature Management**
3. Upload or draw a signature
4. **Activate** the signature (important!)

## 🚀 Methods to Regenerate Certificates

### Method 1: Using the Web Interface

#### Access the Certificate Regeneration Manager

1. Login with admin/HOD credentials
2. Navigate to the Certificate Regeneration Manager
3. Choose your regeneration option:

#### Option A: Regenerate All Certificates
- **Use Case**: Update all certificates in the system
- **Time**: May take several minutes for large numbers
- **Process**: Processes certificates in batches

#### Option B: Regenerate by Event
- **Use Case**: Update certificates for a specific event
- **Process**: Select event from dropdown, regenerate all certificates for that event

#### Option C: Force Regenerate Single Certificate
- **Use Case**: Update a specific certificate
- **Process**: Enter certificate ID (e.g., `CERT-2024-001`)

### Method 2: Using API Endpoints

#### Regenerate All Certificates
```bash
POST /api/certificates/regenerate-all
Authorization: Bearer <token>
Content-Type: application/json

{
  "formats": ["pdf", "image"],
  "batchSize": 10
}
```

#### Regenerate by Event
```bash
POST /api/certificates/regenerate-event/:eventId
Authorization: Bearer <token>
Content-Type: application/json

{
  "formats": ["pdf", "image"]
}
```

#### Force Regenerate Single Certificate
```bash
POST /api/certificates/force-regenerate/:certificateId
Authorization: Bearer <token>
Content-Type: application/json

{
  "formats": ["pdf", "image"]
}
```

### Method 3: Using the Command Line Script

#### Basic Usage
```bash
# Navigate to the backend directory
cd Backend

# Regenerate all certificates
node scripts/regenerateCertificates.js --all

# Dry run (see what would be regenerated without doing it)
node scripts/regenerateCertificates.js --all --dry-run

# Regenerate certificates for a specific event
node scripts/regenerateCertificates.js --event 60f7b3b3b3b3b3b3b3b3b3b3

# Regenerate a specific certificate
node scripts/regenerateCertificates.js --certificate CERT-2024-001

# Custom options
node scripts/regenerateCertificates.js --all --formats pdf --batch-size 5
```

#### Script Options
- `--all`: Regenerate all certificates
- `--event <eventId>`: Regenerate certificates for specific event
- `--certificate <certId>`: Regenerate specific certificate
- `--formats pdf,image`: Specify output formats (default: pdf,image)
- `--batch-size <number>`: Batch size for bulk operations (default: 10)
- `--dry-run`: Preview what would be regenerated without actually doing it

## 📊 Understanding the Process

### What Happens During Regeneration

1. **HOD Detection**: System finds the active HOD with signature
2. **Certificate Fetching**: Retrieves certificate data from database
3. **Template Generation**: Creates new certificate with updated HOD info
4. **Buffer Update**: Replaces old PDF/image buffers with new ones
5. **Audit Logging**: Records the regeneration in certificate audit log

### Performance Considerations

- **Batch Processing**: Large regenerations are processed in batches
- **Memory Usage**: Each certificate generation uses memory for PDF/image creation
- **Time Estimates**:
  - Single certificate: ~2-5 seconds
  - 100 certificates: ~5-10 minutes
  - 1000+ certificates: ~30-60 minutes

### What Gets Updated

✅ **Updated Elements**:
- HOD name (from database)
- HOD signature (if uploaded and active)
- Certificate generation timestamp
- QR code verification data

❌ **Unchanged Elements**:
- Participant information
- Event details
- Certificate ID
- Original issue date
- Download history

## 🔍 Monitoring and Troubleshooting

### Console Logs to Watch For

During regeneration, look for these log messages:

```
🔍 Certificate Generation - Found HOD: Dr. [Name]
🔍 Certificate Generation - HOD has signature: Yes/No
🔍 Certificate Generation - Signature active: Yes/No
🔍 Certificate Generation - Final HOD Name: Dr. [Name]
🔍 Certificate Generation - Using HOD Signature: Yes/No
```

### Common Issues and Solutions

#### Issue: "No HOD found"
**Solution**: Create an active HOD user in the system

#### Issue: "HOD has no signature"
**Solution**: HOD needs to upload and activate their signature

#### Issue: "Certificate generation failed"
**Possible Causes**:
- Missing event data
- Corrupted certificate record
- Database connection issues
- Insufficient memory

#### Issue: "Regeneration is slow"
**Solutions**:
- Reduce batch size
- Run during off-peak hours
- Check server resources

### Verification Steps

After regeneration, verify the results:

1. **Download a Certificate**: Check if HOD name and signature appear correctly
2. **Check Logs**: Review console logs for any errors
3. **Test QR Code**: Ensure certificate verification still works
4. **Compare Before/After**: Verify the changes are applied

## 📈 Best Practices

### Before Regeneration

1. **Backup Database**: Always backup before bulk operations
2. **Test with Single Certificate**: Try one certificate first
3. **Check HOD Status**: Ensure HOD has active signature
4. **Plan Timing**: Run during low-traffic periods

### During Regeneration

1. **Monitor Progress**: Watch console logs for errors
2. **Don't Interrupt**: Let the process complete fully
3. **Check Resources**: Monitor server memory and CPU

### After Regeneration

1. **Verify Results**: Download and check a few certificates
2. **Update Users**: Inform users about the updates
3. **Monitor Downloads**: Ensure download links still work

## 🔐 Security and Permissions

### Required Roles

- **Regenerate All**: Admin or HOD role
- **Regenerate by Event**: Admin, Coordinator, or HOD role
- **Single Certificate**: Admin, Coordinator, or HOD role

### Audit Trail

All regeneration activities are logged with:
- User who performed the action
- Timestamp of regeneration
- Reason for regeneration
- IP address of the request

## 📞 Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify HOD setup and signature status
3. Try regenerating a single certificate first
4. Contact system administrator if problems persist

## 🎉 Success Indicators

You'll know regeneration was successful when:

- ✅ Console shows "Successfully regenerated" messages
- ✅ Downloaded certificates show correct HOD name
- ✅ HOD signature appears on certificates (if uploaded)
- ✅ QR code verification still works
- ✅ No error messages in logs

---

**Note**: Certificate regeneration is a powerful feature that updates existing certificates. Always test with a small number of certificates first before running bulk operations.