const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
    name: 'Course',
    tableName: 'COURSE',
    columns: {
        id: {
            primary: true,
            type: "uuid",
            generated: "uuid",
            nullable: false,
        },
        user_id: {
            type: "uuid",
            nullable: false,
            foreignKey: {
                name: 'course_user_id_fk', // fk 的名稱
                columnNames: ['user_id'],
                referenceTableName: 'USER',
                referenceColumnName: ['id']
            }
        },
        skill_id: {
            type: "uuid",
            nullable: false,
            foreignKey: {
                name: 'course_skill_id_fk', // fk 的名稱
                columnNames: ['skill_id'],
                referenceTableName: 'SKILL',
                referenceColumnName: ['id']
            }
        },
        name: {
            type: 'varchar',
            length: 100,
            nullable: false,
        },
        description: {
            type: 'text',
            nullable: false,
        },
        start_at: {
            type: 'timestamp',
            nullable: false,
        },
        end_at: {
            type: 'timestamp',
            nullable: false,
        },
        max_participants: {
            type: 'integer',
            nullable: false,
        },
        meeting_url: {
            type: 'varchar',
            length: 2048,
            nullable: true,
        },
        created_at: {
            type: 'timestamp',
            nullable: false,
            createDate: true,
        },
        updated_at: {
            type: 'timestamp',
            nullable: false,
            updateDate: true,
        }
    }
})